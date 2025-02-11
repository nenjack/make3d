export const getQueryParams = (): Record<string, string> => {
  if (typeof location === 'undefined') {
    return {};
  }

  const matches = location.search.matchAll(/[?&]([^=?&]+)=?([^?&]*)/g);

  return [...matches].reduce(
    (queryParams, [_wholeMatch, paramName, paramValue]) => ({
      ...queryParams,
      [decodeURIComponent(paramName)]: decodeURIComponent(paramValue)
    }),
    {}
  );
};

export const queryParams = getQueryParams();
