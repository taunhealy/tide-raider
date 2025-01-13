export function getVideoId(url: string): string {
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
  }
  
  export function getVideoThumbnail(url: string, platform: 'youtube' | 'vimeo'): string {
    if (platform === 'youtube') {
      const videoId = getVideoId(url);
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    return ''; // Add Vimeo support if needed
  }