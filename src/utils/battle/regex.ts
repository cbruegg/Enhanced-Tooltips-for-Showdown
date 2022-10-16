import { getQuickJSSync } from 'quickjs-emscripten';

export function replace(str: string, regex: string, replacement: string): string {
  // TODO Use native Regex once Safari supports this Regex feature natively: https://caniuse.com/js-regexp-lookbehind
  const QuickJs = getQuickJSSync();
  const vm = QuickJs.newContext();
  const regexHandle = vm.newString(regex);
  const strHandle = vm.newString(str);
  const replacementHandle = vm.newString(replacement);
  vm.setProp(vm.global, 'regex', regexHandle);
  vm.setProp(vm.global, 'str', strHandle);
  vm.setProp(vm.global, 'replacement', replacementHandle);
  regexHandle.dispose();
  strHandle.dispose();
  replacementHandle.dispose();

  const result = vm.evalCode('str.replace(RegExp(regex), replacement)');
  if (result.error) {
    console.warn('Could not run regex', vm.dump(result.error));
    result.error.dispose();
    return '';
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  const resultStr = vm.dump((result as any).value) as string;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call
  (result as any).value.dispose();
  vm.dispose();
  return resultStr;
}
