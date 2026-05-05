type BackCapableRouter = {
  back: () => void;
  replace?: (href: never) => void;
  canGoBack?: () => boolean;
};

export function backOrReplace(router: BackCapableRouter, fallback: string) {
  if (router.canGoBack?.()) {
    router.back();
    return;
  }

  if (router.replace) {
    router.replace(fallback as never);
    return;
  }

  router.back();
}
