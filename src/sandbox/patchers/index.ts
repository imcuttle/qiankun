/**
 * @author Kuitos
 * @since 2019-04-11
 */

import type { Freer, QiankunSpecialOpts, SandBox } from '../../interfaces';
import { SandBoxType } from '../../interfaces';
import * as css from './css';
import { patchLooseSandbox, patchStrictSandbox } from './dynamicAppend';
import patchHistoryListener from './historyListener';
import patchInterval from './interval';
import patchWindowListener from './windowListener';

export function patchAtMounting(
  appName: string,
  elementGetter: () => HTMLElement | ShadowRoot,
  sandbox: SandBox,
  scopedCSS: boolean,
  excludeAssetFilter?: CallableFunction,
  sandboxConfig?: QiankunSpecialOpts['sandbox'],
): Freer[] {
  const basePatchers = [
    () => patchInterval(sandbox.proxy),
    () => patchWindowListener(sandbox.proxy),
    () => patchHistoryListener(),
  ];

  const patchersInSandbox = {
    [SandBoxType.LegacyProxy]: [
      ...basePatchers,
      () =>
        patchLooseSandbox(
          appName,
          elementGetter,
          sandbox.proxy,
          true,
          scopedCSS,
          excludeAssetFilter,
          (typeof sandboxConfig === 'object' && sandboxConfig.isInvokedByMicroApp) || undefined,
        ),
    ],
    [SandBoxType.Proxy]: [
      ...basePatchers,
      () => patchStrictSandbox(appName, elementGetter, sandbox.proxy, true, scopedCSS, excludeAssetFilter),
    ],
    [SandBoxType.Snapshot]: [
      ...basePatchers,
      () =>
        patchLooseSandbox(
          appName,
          elementGetter,
          sandbox.proxy,
          true,
          scopedCSS,
          excludeAssetFilter,
          (typeof sandboxConfig === 'object' && sandboxConfig.isInvokedByMicroApp) || undefined,
        ),
    ],
  };

  return patchersInSandbox[sandbox.type]?.map((patch) => patch());
}

export function patchAtBootstrapping(
  appName: string,
  elementGetter: () => HTMLElement | ShadowRoot,
  sandbox: SandBox,
  scopedCSS: boolean,
  excludeAssetFilter?: CallableFunction,
  sandboxConfig?: QiankunSpecialOpts['sandbox'],
): Freer[] {
  const patchersInSandbox = {
    [SandBoxType.LegacyProxy]: [
      () =>
        patchLooseSandbox(
          appName,
          elementGetter,
          sandbox.proxy,
          false,
          scopedCSS,
          excludeAssetFilter,
          (typeof sandboxConfig === 'object' && sandboxConfig.isInvokedByMicroApp) || undefined,
        ),
    ],
    [SandBoxType.Proxy]: [
      () => patchStrictSandbox(appName, elementGetter, sandbox.proxy, false, scopedCSS, excludeAssetFilter),
    ],
    [SandBoxType.Snapshot]: [
      () =>
        patchLooseSandbox(
          appName,
          elementGetter,
          sandbox.proxy,
          false,
          scopedCSS,
          excludeAssetFilter,
          (typeof sandboxConfig === 'object' && sandboxConfig.isInvokedByMicroApp) || undefined,
        ),
    ],
  };

  return patchersInSandbox[sandbox.type]?.map((patch) => patch());
}

export { css };
