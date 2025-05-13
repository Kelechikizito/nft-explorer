import { useEffect, useState } from "react";
import Image from "next/image";

export default function NFTCard({ data }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const resolveImageUrl = async () => {
      let rawUrl = data?.image?.originalUrl || data?.image?.cachedUrl;

      if (!rawUrl) {
        let tokenUri = data?.tokenUri || data?.tokenUri?.raw;

        if (tokenUri?.startsWith("ipfs://")) {
          tokenUri = tokenUri.replace("ipfs://", "https://ipfs.io/ipfs/");
        }

        try {
          const res = await fetch(tokenUri);
          const metadata = await res.json();
          rawUrl = metadata?.image;
        } catch (err) {
          console.error("Failed to load metadata:", err);
        }
      }

      if (!rawUrl) return;

      const finalUrl = rawUrl.startsWith("ipfs://")
        ? rawUrl.replace("ipfs://", "https://ipfs.io/ipfs/")
        : rawUrl;

      setImageUrl(finalUrl);
    };

    resolveImageUrl();
  }, [data]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.contract?.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shortAddress = data.contract?.address
    ? data.contract.address.slice(0, 20) + "..."
    : null;

  const shortTokenId =
    data.tokenId.length > 20 ? data.tokenId.slice(0, 20) + "..." : data.tokenId;

  return (
    <div className="p-5 border rounded-lg flex flex-col">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={data.name || "NFT Image"}
          width={500}
          height={500}
          unoptimized
        />
      ) : (
        <div className="w-[500px] h-[500px] bg-gray-200 flex items-center justify-center text-gray-500">
          Loading...
        </div>
      )}

      <div className="mt-2">{data.name || <i>No name provided</i>}</div>

      <div
        className="mt-2 cursor-pointer hover:underline relative"
        title={data.contract?.address}
        onClick={handleCopy}
      >
        {copied ? "Copied!" : shortAddress || <i>No contract address</i>}
      </div>

      <div className="mt-2" title={data.tokenId}>
        Token ID: {shortTokenId}
      </div>
    </div>
  );
}
