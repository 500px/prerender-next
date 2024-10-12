import { createCanvas, loadImage } from "canvas";

function getLines(ctx, text, maxWidth) {
  var words = text.split(" ");
  var lines = [];
  var currentLine = words[0];

  for (var i = 1; i < words.length; i++) {
    var word = words[i];
    var width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

const generatePreviewImage = async (photo) => {
  const cover = photo?.images?.[1]?.url;
  const isQuestWinner = true;
  const isFeatured = photo?.contentStreams?.[0]?.__typename === 'ContentStreamEditorsChoice';
  const isAmbassadorPick = photo?.contentStreams?.[0]?.selectedBy?.type === 'AMBASSADOR';

  const containterWidth = 1200;
  const containterHeight = 624;
  const imageAreaWidth = containterWidth / 2;
  const imageAreaHeight = containterHeight;
  const canvas = createCanvas(containterWidth, containterHeight);
  const ctx = canvas.getContext('2d');

  const image = await loadImage(cover);
  let imageWidth = image.width;
  let imageHeight = image.height;
  let imageRatio = imageWidth / imageHeight;
  if (imageWidth / imageHeight > imageAreaWidth / imageAreaHeight) {
    imageWidth = imageAreaHeight * imageRatio;
    imageHeight = imageAreaHeight;
  } else {
    imageWidth = imageAreaWidth;
    imageHeight = imageAreaWidth / imageRatio;
  }
  ctx.drawImage(image, imageAreaWidth, 0, imageWidth, imageHeight);


  const logo = await loadImage('https://dev.j79-stage.500px.net:3000/logo.svg');
  const logoHeight = 36;
  const logoWidth = 198 / 51 * logoHeight;
  ctx.drawImage(logo, 300 - logoWidth / 2, 30, logoWidth, logoHeight);

  ctx.font = "bold 48px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  getLines(ctx, photo.name, 600).map((text, i) => {
    ctx.fillText(text, 300, 150 + 50 * i, 600);
  })

  let badges = [];
  if (isQuestWinner) {
    badges.push({
      text: 'Quest Winner',
      icon: 'https://dev.j79-stage.500px.net:3000/trophy.svg',
    })
  }
  if (isAmbassadorPick) {
    badges.push({
      text: "Ambassador's pick",
      icon: 'https://dev.j79-stage.500px.net:3000/star.svg',
    })
  }
  if (isFeatured) {
    badges.push({
      text: "Featured",
      icon: 'https://dev.j79-stage.500px.net:3000/featured.svg',
    })
  }

  for (var i = 0; i < badges.length; i++) {
    const badge = badges[i];
    const icon = await loadImage(badge.icon);
    const iconWidth = 36;
    ctx.drawImage(icon, 300 - iconWidth / 2, 240 + 110 * i, iconWidth, iconWidth);
    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(badge.text, 300, 300 + 110 * i, 600);
  }
  
  return canvas.toDataURL('image/jpeg');
}

export default generatePreviewImage;