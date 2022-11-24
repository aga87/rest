export const getHATEOAS = (
  linkToSelf: string,
  links: { href: string; rel: string }[]
): { href: string; rel: string }[] => {
  return [
    {
      href: `${process.env.BASE_URL}${linkToSelf}`,
      rel: 'self'
    },
    ...links
  ];
};
