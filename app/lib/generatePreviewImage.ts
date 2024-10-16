import { createCanvas, loadImage, registerFont } from "canvas";
import graphqlQuery from "../lib/graphqlQuery";
import { dataURItoBlob, getLines, getEllipsisText } from "../lib/utils";
import createPhotoMutation from "../query/CreatePhotoMutation";

interface Photo {
  images: { url: string }[];
  contentStreams: {
    __typename: string;
    selectedBy: { type: string };
  }[];
  name: string;
  uploader: {
    avatar: { images: { url: string }[] };
    displayName: string;
  };
  pulse: { highest: number };
}

const baseUrl = "http://localhost:3000";

const getFont = (text: string, fontSize: number, bold: Boolean) =>
  /[\u4e00-\u9fff]/.test(text)
    ? `${fontSize}px Helvetica`
    : bold
    ? `${fontSize}px Outfit Bold`
    : `${fontSize}px Outfit`;

const generatePreviewImage = async (photo: Photo, isTemporary = false) => {
  const cover = photo?.images?.[0]?.url;
  const isPopular = photo?.pulse?.highest >= 80;
  const isFeatured =
    photo?.contentStreams?.[0]?.__typename === "ContentStreamEditorsChoice" &&
    photo?.contentStreams?.[0]?.selectedBy?.type === "ADMIN";
  const isAmbassadorPick =
    photo?.contentStreams?.[0]?.selectedBy?.type === "AMBASSADOR";

  registerFont(`./public/OutfitRegular.ttf`, { family: "Outfit" });
  registerFont(`./public/OutfitBold.ttf`, { family: "Outfit Bold" });

  const containterWidth = 928;
  const containterHeight = 484;
  const containerPadding = 24;
  const baseFontSize = 24;
  const largeFontSize = 36;
  const badgeHeight = 48;
  const imageAreaWidth = containterWidth / 2;
  const imageAreaHeight = containterHeight;
  const canvas = createCanvas(containterWidth, containterHeight);
  const ctx = canvas.getContext("2d");

  // cover image
  const image = await loadImage(cover);
  let imageWidth = image.width;
  let imageHeight = image.height;
  let imageRatio = imageWidth / imageHeight;
  let imageOffsetX = 0;
  let imageOffsetY = 0;
  if (imageWidth / imageHeight > imageAreaWidth / imageAreaHeight) {
    imageWidth = imageAreaHeight * imageRatio;
    imageHeight = imageAreaHeight;
    imageOffsetX = (containterWidth * 3) / 4 - imageWidth / 2;
    imageOffsetY = 0;
  } else {
    imageWidth = imageAreaWidth;
    imageHeight = imageAreaWidth / imageRatio;
    imageOffsetX = containterWidth / 2;
    imageOffsetY = containterHeight / 2 - imageHeight / 2;
  }
  ctx.drawImage(image, imageOffsetX, imageOffsetY, imageWidth, imageHeight);

  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.rect(0, 0, containterWidth / 2, containterHeight);
  ctx.fill();

  // logo
  const logo = await loadImage(`${baseUrl}/logo.svg`);
  const logoWidth = 116;
  const logoHeight = 28;
  ctx.drawImage(
    logo,
    containerPadding,
    containerPadding,
    logoWidth,
    logoHeight
  );

  // badges
  let badges = [];
  if (isPopular) {
    badges.push({
      text: "Popular",
      icon: `${baseUrl}/popular.svg`,
      iconX: 58 * 2,
    });
  }
  if (isAmbassadorPick) {
    badges.push({
      text: "Ambassador's pick",
      icon: `${baseUrl}/star.svg`,
      iconX: 117 * 2,
    });
  }
  if (isFeatured) {
    badges.push({
      text: "Editors' Choice",
      icon: `${baseUrl}/featured.svg`,
      iconX: 96 * 2,
    });
  }
  for (var i = 0; i < badges.length; i++) {
    const badge = badges[i];
    const icon = await loadImage(badge.icon);
    const iconWidth = 32;
    const badgeTop = containterHeight - badgeHeight * (i + 1);
    ctx.drawImage(
      icon,
      badge.iconX,
      badgeTop - iconWidth / 2,
      iconWidth,
      iconWidth
    );
    ctx.font = `${baseFontSize}px Outfit`;
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(badge.text, containerPadding, badgeTop, containterWidth / 2);
  }

  // uploader
  const uploaderAvatar = photo.uploader.avatar?.images?.[0]?.url;
  const uploaderName = photo.uploader?.displayName;
  const uploaderNameLeft = 88;
  const uploaderNameMaxWidth =
    containterWidth / 2 - uploaderNameLeft - containerPadding;
  ctx.font = getFont(uploaderName, largeFontSize, true);
  ctx.textBaseline = "top";
  const uploaderNameLines = getLines(ctx, uploaderName, uploaderNameMaxWidth);

  const infoBaseBottom =
    containterHeight - containerPadding - badgeHeight * badges.length;
  const infoBaseTop = containerPadding + logoHeight;
  const infoBaseCenter = (infoBaseBottom - infoBaseTop) / 2 + infoBaseTop;
  const infoBaseLine =
    uploaderNameLines.length >= 2 ? infoBaseCenter - 20 : infoBaseCenter;

  const uploaderAvatarImage = await loadImage(uploaderAvatar);
  ctx.save();
  ctx.beginPath();
  ctx.arc(containerPadding + 24, infoBaseLine + 24, 24, 0, 2 * Math.PI);
  ctx.clip();
  ctx.drawImage(uploaderAvatarImage, containerPadding, infoBaseLine, 48, 48);
  ctx.restore();

  uploaderNameLines.slice(0, 2).map((text, i) => {
    const twoLineText =
      uploaderNameLines.length > 2 ? text.slice(0, 18) + "..." : text;
    ctx.fillText(
      i === 0 ? text : twoLineText,
      uploaderNameLeft,
      infoBaseLine + 40 * i,
      containterWidth / 2
    );
  });

  // title
  ctx.font = getFont(photo.name, baseFontSize, false);
  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillText(
    getEllipsisText(
      ctx,
      photo.name,
      containterWidth / 2 - containerPadding * 2,
      30
    ),
    containerPadding,
    infoBaseLine - 12,
    containterWidth / 2
  );

  if (isTemporary) {
    return canvas.toDataURL("image/jpeg");
  }

  const dataURL = canvas.toDataURL("image/jpeg");
  const file = dataURItoBlob(dataURL);

  const { createPhoto } = await graphqlQuery(createPhotoMutation, {
    input: {
      autoPublish: false,
    },
  });
  const { directUpload } = createPhoto;
  const { url, fields } = directUpload;

  const formData = new FormData();
  const fieldsObj = JSON.parse(fields);
  Object.keys(fieldsObj).forEach((key) => {
    formData.append(key, fieldsObj[key]);
  });
  formData.append("file", file);
  console.log(fieldsObj.key);

  try {
    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });
    console.log(res);
  } catch (err) {
    console.log("error", err);
  }

  return dataURL;
};

export default generatePreviewImage;
