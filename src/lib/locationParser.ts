import { CustomError } from "../exceptions/CustomError";

export function parseLatLong(url: string) {
  const regex = /@([\d.]+),([\d.]+),/;
  const match = url.match(regex);

  if (match && match.length >= 3) {
    const latitude = parseFloat(match[1]);
    const longitude = parseFloat(match[2]);
    return { latitude, longitude };
  } else {
    throw new CustomError(
      `Please provide the actual Google Maps link, not the "Link to share".`,
      400
    );
  }
}
