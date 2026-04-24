export const calculateTime = (tokenNumber, currentToken, timePerToken) => {
  return (tokenNumber - currentToken) * timePerToken;
};