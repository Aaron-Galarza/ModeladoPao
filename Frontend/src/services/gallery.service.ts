// Frontend/src/services/gallery.service.ts

import { getFunctions, httpsCallable } from 'firebase/functions';

export interface GalleryImage {
    public_id: string;
    secure_url: string;
    format: string;
    width: number;
    height: number;
    created_at: string;
    bytes: number;
}

interface IGalleryCallData {
    action: 'list' | 'delete';
    publicId?: string;
}

const galleryCallable = httpsCallable<IGalleryCallData, any>(getFunctions(), 'gallery');

export async function listGallery(): Promise<GalleryImage[]> {
    const result = await galleryCallable({ action: 'list' });
    return (result.data.resources as GalleryImage[]) || [];
}

export async function deleteGalleryImage(publicId: string): Promise<void> {
    await galleryCallable({ action: 'delete', publicId });
}

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

export interface CloudinaryUploadResponse {
    public_id: string;
    secure_url: string;
}

export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any)?.error?.message || 'Error al subir la imagen.');
    }

    return res.json();
}
