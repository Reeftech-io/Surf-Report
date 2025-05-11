const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'jfif', 'webp'];
const videoExtensions = ['mp4'];
const cardImages = [
'1.jfif',
'2.mp4',
'3.jfif',
'4.jfif',
'5.png',
'6.mp4',
'7.jfif',
'8.jfif',
'9.jfif',
'10.jfif',
'11.jfif',
'12.jfif',
'13.jfif',
'14.jfif',
'15.jfif',
'16.jfif',
'17.jfif',
'18.jfif',
'19.jfif',
];

function getRandomCardImage() {
    if (cardImages.length === 0) {
        console.error('No images or videos found in cards folder.');
        return null;
    }
    const randomIndex = Math.floor(Math.random() * cardImages.length);
    return `cards/${cardImages[randomIndex]}`;
}

function isVideoFile(filePath) {
    const extension = filePath.split('.').pop().toLowerCase();
    return videoExtensions.includes(extension);
}

function updateCardImage() {
    const cardImageElement = document.getElementById('card-image');
    const cardVideoElement = document.getElementById('card-video');
    const filePath = getRandomCardImage();

    cardImageElement.style.display = 'none';
    cardVideoElement.style.display = 'none';
    cardVideoElement.innerHTML = '';

    if (filePath) {
        if (isVideoFile(filePath)) {
            const sourceElement = document.createElement('source');
            sourceElement.src = filePath;
            sourceElement.type = 'video/mp4';
            cardVideoElement.appendChild(sourceElement);
            cardVideoElement.style.display = 'block';
            cardVideoElement.onerror = () => {
                console.error(`Failed to load video: ${filePath}`);
                cardVideoElement.style.display = 'none';
            };
        } else {
            cardImageElement.src = filePath;
            cardImageElement.style.display = 'block';
            cardImageElement.onerror = () => {
                console.error(`Failed to load image: ${filePath}`);
                cardImageElement.style.display = 'none';
            };
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateCardImage();
    setInterval(updateCardImage, 3000);
});