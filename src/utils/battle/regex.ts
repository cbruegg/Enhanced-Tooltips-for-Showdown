import { getQuickJSSync } from 'quickjs-emscripten';

let supportsRegexLookBehindNativelyCache: boolean | undefined;
export function supportsRegexLookBehindNatively(): boolean {
  if (supportsRegexLookBehindNativelyCache !== undefined) return supportsRegexLookBehindNativelyCache;

  // Test for Safari: https://caniuse.com/js-regexp-lookbehind
  // https://bugs.webkit.org/show_bug.cgi?id=174931
  try {
    // Cannot use Regex literal to test as it's considered a syntax error to use lookbehind when it's not supported
    // eslint-disable-next-line prefer-regex-literals
    RegExp('(?<!not)this');
    supportsRegexLookBehindNativelyCache = true;
    console.log('Regular expressions are supported natively.');
    return true;
  } catch (e) {
    supportsRegexLookBehindNativelyCache = false;
    console.log('Using QuickJS for lookbehind Regex execution');
    return false;
  }
}

function isSupportedNatively(regex: string): boolean {
  const containsLookbehind = regex.includes('?<=') || regex.includes('?<!');
  return !containsLookbehind || supportsRegexLookBehindNatively();
}

export function replace(str: string, regex: string, replacement: string, flags?: string): string {
  if (isSupportedNatively(regex)) {
    return str.replace(RegExp(regex, flags), replacement);
  }

  console.log('Using fallback regex replace implementation');

  const QuickJs = getQuickJSSync();
  const vm = QuickJs.newContext();
  const regexHandle = vm.newString(regex);
  const strHandle = vm.newString(str);
  const replacementHandle = vm.newString(replacement);
  const flagsHandle = flags ? vm.newString(flags) : vm.undefined;
  vm.setProp(vm.global, 'regex', regexHandle);
  vm.setProp(vm.global, 'str', strHandle);
  vm.setProp(vm.global, 'replacement', replacementHandle);
  vm.setProp(vm.global, 'flags', flagsHandle);
  regexHandle.dispose();
  strHandle.dispose();
  replacementHandle.dispose();

  const result = vm.evalCode('str.replace(RegExp(regex, flags), replacement)');
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

export function test(regex: string, str: string): boolean {
  if (isSupportedNatively(regex)) {
    return RegExp(regex).test(str);
  }

  console.log('Using fallback regex test implementation');

  const QuickJs = getQuickJSSync();
  const vm = QuickJs.newContext();
  const regexHandle = vm.newString(regex);
  const strHandle = vm.newString(str);
  vm.setProp(vm.global, 'regex', regexHandle);
  vm.setProp(vm.global, 'str', strHandle);
  regexHandle.dispose();
  strHandle.dispose();

  const result = vm.evalCode('RegExp(regex).test(str)');
  if (result.error) {
    console.warn('Could not run regex', vm.dump(result.error));
    result.error.dispose();
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  const resultBool = vm.dump((result as any).value) as boolean;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call
  (result as any).value.dispose();
  vm.dispose();
  return resultBool;
}

export function matchAndReturnFirst(regex: string, str: string): string {
  if (isSupportedNatively(regex)) {
    return RegExp(regex).exec(str)[0];
  }

  console.log('Using fallback regex matchAndReturnFirst implementation');

  const QuickJs = getQuickJSSync();
  const vm = QuickJs.newContext();
  const regexHandle = vm.newString(regex);
  const strHandle = vm.newString(str);
  vm.setProp(vm.global, 'regex', regexHandle);
  vm.setProp(vm.global, 'str', strHandle);
  regexHandle.dispose();
  strHandle.dispose();

  const result = vm.evalCode('RegExp(regex).exec(str)[0]');
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
