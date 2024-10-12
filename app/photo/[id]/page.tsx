import type { Metadata, ResolvingMetadata } from "next";
import graphqlQuery from "../../lib/graphqlQuery";

const photoQuery = `
  query PhotoQueryRendererQuery($photoLegacyId: ID!, $resourceType: String!) {
    photo: nodeByLegacyId(legacyId: $photoLegacyId, resourceType: $resourceType) {
      ... on Photo {
        id
        legacyId
        name
        canonicalPath
        images(sizes: [33]) {
          id
          url
        }
        uploader {
          id
          username
          displayName
        }
      }
    }
  }
`;

export async function generateMetadata(
  {
    params,
    searchParams,
  }: {
    params: { id: string };
    searchParams: { flag: string };
  },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const flag = searchParams?.flag === "1";
  const { photo } = await graphqlQuery(photoQuery, {
    photoLegacyId: params.id,
    resourceType: "Photo",
  });

  const imageURL = flag
    ? "https://drscdn.500px.org/photo/1101923550/q%3D80_m%3D600/v2?sig=42f235a69f34dd37b20f508d45a683594fb4722b4e1e520d9b2a721728b636ae"
    : photo?.images?.[0]?.url;

  const url = flag
    ? `https://500px.com${photo.canonicalPath}?flag=1`
    : `https://500px.com${photo.canonicalPath}`;

  return {
    applicationName: "500px",
    title: `${photo.name} by ${photo.uploader.displayName} / 500px`,
    description: `Explore this photo titled ${photo.name} by ${photo.uploader.displayName} (@${photo.uploader.username}) on 500px`,
    keywords: [
      "500px",
      "photographers",
      "photography",
      "photo",
      "photos",
      "inspiring photography",
      "photo sharing",
      "photography community",
      "photo download",
      "wall art",
      "commercial photography",
      "pulse",
      "affection",
      "flow",
      "following",
      "activity",
      "fresh",
      "upcoming",
      "editors",
      "photo portfolio",
    ],
    // The Facebook AppLinks metadata
    appLinks: {
      ios: {
        app_store_id: "471965292",
        app_name: "500px",
        url,
      },
      android: {
        package: "com.fivehundredpx.viewer",
        app_name: "500px",
        url,
      },
    },
    // The Open Graph metadata
    openGraph: {
      url,
      images: [imageURL],
    },
    twitter: {
      card: "summary_large_image",
      site: "500px.com",
    },
    other: {
      "twitter:app:name:iphone": "500px",
      "twitter:app:name:ipad": "500px",
      "twitter:app:name:googleplay": "500px",
      "twitter:app:url:googleplay": url,
      "twitter:app:id:iphone": "471965292",
      "twitter:app:id:ipad": "471965292",
      "twitter:app:id:googleplay": "com.fivehundredpx.viewer",
    },
  };
}

const PhotoDetail = async () => {
  return <></>;
};

export default PhotoDetail;
