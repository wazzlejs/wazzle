import sysPath from 'path';
import childProcess, { ChildProcess } from 'child_process';
import webpack, { Compiler, Compilation } from 'webpack';

export interface StartServerPluginOptions {
  verbose: boolean;
  entryName: string;
  once: boolean;
  nodeArgs: string[];
  scriptArgs: string[];
  signal: boolean | string;
  restartable: boolean;
  inject: boolean;
  killOnExit: boolean;
  killOnError: boolean;
  killTimeout: number;
}

export default class StartServerPlugin {
  options: StartServerPluginOptions;
  worker?: ChildProcess;
  scriptFile?: string;
  workerLoaded = false;

  constructor(options: Partial<StartServerPluginOptions> | string) {
    if (options == null) {
      options = {};
    }
    if (typeof options === 'string') {
      options = { entryName: options };
    }
    this.options = Object.assign(
      {
        verbose: true, // print logs
        entryName: 'main', // What to run
        once: false, // Run once and exit when worker exits
        nodeArgs: [], // Node arguments for worker
        scriptArgs: [], // Script arguments for worker
        signal: false, // Send a signal instead of a message
        // Only listen on keyboard in development, so the server doesn't hang forever
        restartable: process.env.NODE_ENV === 'development',
        inject: true, // inject monitor to script
        killOnExit: true, // issue SIGKILL on child process exit
        killOnError: true, // issue SIGKILL on child process error
        killTimeout: 1000, // timeout before SIGKILL in milliseconds
      },
      options
    );
    if (!Array.isArray(this.options.scriptArgs)) {
      throw new Error('options.args has to be an array of strings');
    }
    if (this.options.signal === true) {
      this.options.signal = 'SIGUSR2';
      this.options.inject = false;
    }

    if (this.options.restartable && !options.once) {
      this.enableRestarting();
    }
  }

  apply(compiler: Compiler) {
    const inject = this.options.inject;
    const plugin = { name: 'StartServerPlugin' };
    if (inject) {
      compiler.hooks.make.tap(plugin, (compilation) => {
        compilation.addEntry(
          compilation.compiler.context,
          webpack.EntryPlugin.createDependency(this.getMonitor(), {
            name: this.options.entryName,
          }),
          this.options.entryName,
          () => {}
        );
      });
    }
    compiler.hooks.afterEmit.tapAsync(plugin, this.afterEmit);
  }

  getMonitor() {
    const loaderPath = require.resolve('./monitor-loader');
    return `!!${loaderPath}!${loaderPath}`;
  }

  runWorker(callback?: () => void) {
    if (this.worker) return;
    const {
      scriptFile,
      options: { scriptArgs },
    } = this;

    const execArgv = this.getExecArgv();
    const extScriptArgs = ['--color', '--ansi', ...scriptArgs];

    if (this.options.verbose) {
      const cmdline = [...execArgv, scriptFile, '--', ...extScriptArgs].join(' ');
      this.info(`running \`node ${cmdline}\``);
    }

    const worker = childProcess.fork(scriptFile!, extScriptArgs, {
      execArgv,
      silent: true,
      env: Object.assign(process.env, { FORCE_COLOR: 3 }),
    });
    worker.on('exit', this.handleChildExit);
    worker.on('quit', this.handleChildQuit);
    worker.on('error', this.handleChildError);
    worker.on('message', this.handleChildMessage);
    worker!.stdout!.on('data', this.workerInfo);
    worker!.stderr!.on('data', this.workerError);
    process.on('SIGINT', this.handleWebpackExit);

    this.worker = worker;

    if (callback) callback();
  }

  handleChildQuit = () => {
    this.worker = undefined;
  };

  handleChildError() {
    this.error('Script errored');
    this.worker = undefined;

    if (this.options.killOnError) {
      this.handleProcessKill();
    }
  }

  handleWebpackExit = () => {
    if (this.worker) {
      process.kill(this.worker!.pid!, 'SIGINT');
    }
  };

  handleChildMessage(message: string) {
    if (message === 'SSWP_LOADED') {
      this.workerLoaded = true;
      this.info('Script loaded');
      if (process.env.NODE_ENV === 'test' && this.options.once) {
        process.kill(this.worker!.pid!);
      }
    } else if (message === 'SSWP_HMR_FAIL') {
      this.workerLoaded = false;
    }
  }

  handleChildExit = (code: number, signal: string) => {
    this.error(`Script exited with ${signal ? `signal ${signal}` : `code ${code}`}`);
    this.worker = undefined;

    if (code === 143 || signal === 'SIGTERM') {
      if (!this.workerLoaded) {
        this.error('Script did not load, or HMR failed; not restarting');
        return;
      }
      if (this.options.once) {
        this.info('Only running script once, as requested');
        return;
      }

      this.workerLoaded = false;
      this.runWorker();
      return;
    }

    if (this.options.killOnExit) {
      this.handleProcessKill();
    }
  };

  handleProcessKill() {
    const pKill = () => process.kill(process.pid, 'SIGKILL');

    if (!isNaN(this.options.killTimeout)) {
      setTimeout(pKill, this.options.killTimeout);
    } else {
      pKill();
    }
  }

  getExecArgv() {
    const { options } = this;
    const execArgv = (options.nodeArgs || []).concat(process.execArgv);
    return execArgv;
  }

  enableRestarting() {
    this.info('Type `rs<Enter>` to restart the worker');
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (data: string) => {
      if (data.trim() === 'rs') {
        if (this.worker != undefined) {
          this.info('Killing worker...');
          process.kill(this.worker.pid!);
        } else {
          this.runWorker();
        }
      }
    });
  }

  getScript(compilation: Compilation) {
    const { entryName } = this.options;
    const entrypoints = compilation.entrypoints;

    const entry = entrypoints.get(entryName);
    if (!entry) {
      this.info('compilation: %O', compilation);
      throw new Error(
        `Requested entry "${entryName}" does not exist, try one of: ${[
          ...(entrypoints.keys ? entrypoints.keys() : Object.keys(entrypoints)),
        ].join(' ')}`
      );
    }

    const runtimeChunk = entry.getRuntimeChunk();

    const entryChunk = entry.getEntrypointChunk();
    const runtimeChunkFiles = runtimeChunk?.files.values();
    const entryScript = runtimeChunkFiles?.next().value || entryChunk?.files.values().next().value;
    if (!entryScript) {
      this.error('Entry chunk not outputted: %O', entry);
      return;
    }
    const { path } = compilation.outputOptions;
    return sysPath.resolve(path!, entryScript);
  }

  info(msg: string, ...args: unknown[]) {
    if (this.options.verbose) console.log(`sswp> ${msg}`, ...args);
  }

  workerError = (msg: string, ...args: unknown[]) => {
    process.stderr.write(msg);
  };

  workerInfo = (msg: string, ...args: unknown[]) => {
    process.stdout.write(msg);
  };

  error(msg: string, ...args: unknown[]) {
    console.error(`sswp> !!! ${msg}`, ...args);
  }

  afterEmit = (compilation: Compilation, callback: () => void) => {
    this.scriptFile = this.getScript(compilation);

    if (this.worker) {
      return this.hmrWorker(compilation, callback);
    }

    if (!this.scriptFile) return;

    this.runWorker(callback);
  };

  hmrWorker(compilation: Compilation, callback: () => void) {
    const {
      worker,
      options: { signal },
    } = this;
    if (signal) {
      process.kill(worker!.pid!, signal as string);
    } else {
      worker!.send('SSWP_HMR');
    }

    callback();
  }
}
