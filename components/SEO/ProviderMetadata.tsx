import { Metadata } from "next";

interface ProviderMetadataProps {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  providerType: string;
  averageRating?: number | null;
  reviewCount: number;
  priceMin?: number | null;
  priceMax?: number | null;
  photos: string[];
  coverPhoto?: string | null;
}

export function generateProviderMetadata({
  name,
  description,
  address,
  city,
  state,
  zipCode,
  phone,
  providerType,
  averageRating,
  reviewCount,
  priceMin,
  priceMax,
  photos,
  coverPhoto,
}: ProviderMetadataProps): Metadata {
  const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;
  const formattedType = providerType
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");

  const title = `${name} - ${formattedType} in ${city}, ${state}`;
  const metaDescription =
    description ||
    `Find quality ${formattedType.toLowerCase()} services at ${name} in ${city}, ${state}. ${
      averageRating && reviewCount > 0
        ? `Rated ${averageRating.toFixed(1)}/5 from ${reviewCount} reviews.`
        : ""
    } Contact us today to learn more.`;

  const imageUrl = coverPhoto || photos[0] || "/default-provider-image.jpg";

  return {
    title,
    description: metaDescription.slice(0, 160), // Meta descriptions should be under 160 chars
    openGraph: {
      title,
      description: metaDescription.slice(0, 200),
      type: "business.business",
      url: typeof window !== "undefined" ? window.location.href : "",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${name} - ${formattedType}`,
        },
      ],
      siteName: "Olera",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: metaDescription.slice(0, 200),
      images: [imageUrl],
    },
    alternates: {
      canonical: typeof window !== "undefined" ? window.location.href : "",
    },
  };
}

export function generateProviderJsonLd({
  name,
  description,
  address,
  city,
  state,
  zipCode,
  phone,
  providerType,
  averageRating,
  reviewCount,
  priceMin,
  priceMax,
}: Omit<ProviderMetadataProps, "photos" | "coverPhoto">) {
  const formattedType = providerType
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");

  return {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    name,
    description: description || `${formattedType} services in ${city}, ${state}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: address,
      addressLocality: city,
      addressRegion: state,
      postalCode: zipCode,
      addressCountry: "US",
    },
    telephone: phone,
    priceRange:
      priceMin && priceMax
        ? `$${priceMin}-$${priceMax}`
        : priceMin
        ? `Starting at $${priceMin}`
        : "Contact for pricing",
    ...(averageRating &&
      reviewCount > 0 && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: averageRating,
          reviewCount: reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      }),
  };
}
