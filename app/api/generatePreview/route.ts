import { NextResponse } from "next/server";
import graphqlQuery from "../../lib/graphqlQuery";
import generatePreviewImage from "../../lib/generatePreviewImage";
import photoAwardQuery from "../../query/PhotoAwardQuery";

export async function POST(request: Request) {
  // {type: "photo", id: "1001297210"}
  const data = await request.json();
  const { type, id } = data;
  let dataURI;

  if (type === "photo") {
    const { photo } = await graphqlQuery(photoAwardQuery, {
      photoLegacyId: id,
      resourceType: "Photo",
    });
    dataURI = await generatePreviewImage(photo, true);
  }

  return NextResponse.json({ dataURI });
}
