import { transform } from './transform';
import { DazzleWebpack5LoaderContext, DazzleWebpack5LoaderDefinitionFunction, Source, SourceMap } from './types';

async function dazzleBabelLoader(
  this: DazzleWebpack5LoaderContext,
  inputSource: Source,
  inputSourceMap: SourceMap
): Promise<[Source, SourceMap]> {
  const filename = this.resourcePath;
  const target = this.target;
  const loaderOptions = this.getOptions();

  const result = await transform.call(this, inputSource, inputSourceMap, loaderOptions, filename, target);
  const { code: transformedSource, map: outputSourceMap } = result || {
    code: '',
    map: '',
  };

  return [transformedSource, outputSourceMap || inputSourceMap];
}

const dazzleBabelLoaderOuter: DazzleWebpack5LoaderDefinitionFunction = function (
  this: DazzleWebpack5LoaderContext,
  inputSource,
  inputSourceMap
) {
  const callback = this.async();
  dazzleBabelLoader.call(this, inputSource, inputSourceMap).then(
    ([transformedSource, outputSourceMap]) => {
      callback(null, transformedSource, outputSourceMap || inputSourceMap);
    },
    (err) => {
      callback(err);
    }
  );
};
export default dazzleBabelLoaderOuter;
