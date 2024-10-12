import type { Metadata, ResolvingMetadata } from "next";
import graphqlQuery from "../../lib/graphqlQuery";
import generatePreviewImage from "../../lib/generatePreviewImage";

const photoQuery = `
  query PhotoQueryRendererQuery($photoLegacyId: ID!, $resourceType: String!) {
    photo: nodeByLegacyId(legacyId: $photoLegacyId, resourceType: $resourceType) {
      ... on Photo {
        id
        legacyId
        name
        canonicalPath
        width
        height
        images(sizes: [33, 35]) {
          id
          url
        }
        uploader {
          id
          username
          displayName
        }
        contentStreams {
          __typename
          ...on ContentStreamEditorsChoice {
            selectedBy {
              type
            }
          }
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
    ? await generatePreviewImage(photo)
    : photo?.images?.[0]?.url;

  const url = flag
    ? `${process.env.REACT_APP_BASE_URL}${photo.canonicalPath}?flag=1`
    : `${process.env.REACT_APP_BASE_URL}${photo.canonicalPath}`;

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

const PhotoDetail = async ({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { flag: string };
}) => {
  const { photo } = await graphqlQuery(photoQuery, {
    photoLegacyId: params.id,
    resourceType: "Photo",
  });
  const url = await generatePreviewImage(photo);
  return (
    <>
      <img src={url} alt={photo.name} />
    </>
  );
};

export default PhotoDetail;
