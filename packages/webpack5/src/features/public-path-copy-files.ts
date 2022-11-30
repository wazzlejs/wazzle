import { DazzleContext } from '@wazzle/wazzle';
import { WebpackConfig } from '../types';
import CopyPlugin from 'copy-webpack-plugin';
import fs from 'fs';

export function configurePublicPathCopyToOutput({ paths }: DazzleContext, { plugins }: WebpackConfig) {
  if (!fs.existsSync(paths.appPublic)) {
    return;
  }

  plugins!.push(
    new CopyPlugin({
      patterns: [
        {
          from: paths.appPublic.replace(/\\/g, '/') + '/**/*',
          to: paths.appBuild,
          context: paths.appPath,
          globOptions: {
            ignore: [paths.appPublic.replace(/\\/g, '/') + '/index.html'],
          },
        },
      ],
    })
  );
}
