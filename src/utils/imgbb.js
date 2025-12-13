
export const uploadToImgBB = async (file) => {
    // Note: In a real production app, you should proxy this request to hide the API key,
    // or use a signed upload if supported. For this MVP, client-side upload is fine.

    // We use the key provided by the user
    const API_KEY = "665da80cebc30bf1b0dfa51abd41871e";

    const formData = new FormData();
    formData.append("image", file);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (data.success) {
            return data.data.url;
        } else {
            console.error("ImgBB Error:", data);
            throw new Error(data.error?.message || "Upload failed");
        }
    } catch (error) {
        console.error("Upload error:", error);
        // Return a fallback image if upload fails so the flow isn't broken
        return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop';
    }
};
