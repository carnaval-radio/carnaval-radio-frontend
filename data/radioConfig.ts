export function getRadioSource() {
  const provider = process.env.NEXT_PUBLIC_RADIO_PROVIDER || "coophosting";
  if (provider !== "coophosting" && provider !== "reliastream") {
    throw new Error(`Unsupported radio provider: ${provider}`);
  }

  return {
    provider,
    streamUrl: process.env.NEXT_PUBLIC_RADIO_STREAM_URL || (
      provider === "coophosting"
        ? "https://server1.coophosting.nl/proxy/novanani/stream"
        : process.env.NEXT_PUBLIC_STREAM_FALLBACK || "https://secure1.reliastream.com/Carnaval-Radio/;"
    ),
    songsUrl: process.env.NEXT_PUBLIC_RADIO_SONGS_URL || (
      provider === "coophosting"
        ? "https://server1.coophosting.nl:2199/recentfeed/novanani/json/"
        : "https://s20.reliastream.com:2020/json/stream/8010"
    ),
    useCmsStream: provider === "reliastream" && !process.env.NEXT_PUBLIC_RADIO_STREAM_URL,
  };
}
