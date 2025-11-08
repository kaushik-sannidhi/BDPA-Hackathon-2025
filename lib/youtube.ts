const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export async function searchYouTubeVideos(
  query: string,
  maxResults: number = 5
): Promise<{
  title: string;
  url: string;
  platform: string;
  type: "Video";
  description: string;
  duration: string;
}[]> {
  if (!YOUTUBE_API_KEY) {
    console.warn("YOUTUBE_API_KEY not set, providing Google search fallback.");
    const googleSearchQuery = encodeURIComponent(`${query} video tutorial`);
    return [
      {
        title: `Search for "${query}" video tutorials on Google`,
        url: `https://www.google.com/search?q=${googleSearchQuery}`,
        platform: "Google Search",
        type: "Video",
        description: `A Google search for video tutorials on ${query}.`,
        duration: "N/A",
      },
    ];
  }

  try {
    const searchQuery = encodeURIComponent(query);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=${maxResults}&order=relevance&key=${YOUTUBE_API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("YouTube API request failed");
    }

    const data = await response.json();

    return data.items.map((item: any) => ({
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      platform: "YouTube",
      type: "Video" as const,
      description: item.snippet.description,
      duration: "N/A", // Would need video details API for duration
    }));
  } catch (error) {
    console.error("Error searching YouTube:", error);
    return [];
  }
}

