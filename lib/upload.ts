/**
 * Swappable image upload utility.
 * Currently supports Cloudinary. Falls back to a base64 data URL for local dev.
 */
export async function uploadImage(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (cloudName) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "onlytrades");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.secure_url as string;
  }

  // Local fallback: return object URL
  return URL.createObjectURL(file);
}
