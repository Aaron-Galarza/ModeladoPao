// Frontend/src/pages/managements/gallerymanagement.tsx

import { useState, useEffect, useRef } from 'react';
import { FaUpload, FaCopy, FaTrash, FaCheck, FaSpinner, FaImages } from 'react-icons/fa';
import {
    listGallery,
    deleteGalleryImage,
    uploadToCloudinary,
} from '../../services/gallery.service';
import type { GalleryImage } from '../../services/gallery.service';

const GalleryManagement = () => {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [uploading, setUploading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchGallery = async () => {
        setLoading(true);
        setError(null);
        try {
            const resources = await listGallery();
            const sorted = [...resources].sort((a, b) =>
                (b.created_at || '').localeCompare(a.created_at || '')
            );
            setImages(sorted);
        } catch (err: any) {
            console.error('Error al cargar la galería:', err);
            setError(`Error al cargar la galería: ${err.message || err.details || 'Acceso denegado.'}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGallery();
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploading(true);
        setError(null);

        let ok = 0;
        let failed = 0;

        for (const file of files) {
            setUploadProgress(`Subiendo ${ok + failed + 1} de ${files.length}: ${file.name}`);
            try {
                await uploadToCloudinary(file);
                ok++;
            } catch (err: any) {
                failed++;
                console.error(`Error subiendo ${file.name}:`, err);
            }
        }

        setUploading(false);
        setUploadProgress('');

        if (failed > 0) {
            setError(`Se subieron ${ok} imágenes y fallaron ${failed}.`);
        }

        if (e.target) {
            e.target.value = '';
        }

        await fetchGallery();
    };

    const handleCopyUrl = async (image: GalleryImage) => {
        try {
            await navigator.clipboard.writeText(image.secure_url);
        } catch {
            const textarea = document.createElement('textarea');
            textarea.value = image.secure_url;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
        setCopiedId(image.public_id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDelete = async (image: GalleryImage) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta imagen de la galería?')) return;
        setError(null);
        try {
            await deleteGalleryImage(image.public_id);
            setImages((prev) => prev.filter((img) => img.public_id !== image.public_id));
        } catch (err: any) {
            console.error('Error al eliminar:', err);
            setError(`Error al eliminar: ${err.message || err.details}`);
        }
    };

    const formatBytes = (bytes: number) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="container mx-auto px-4 py-6 md:py-8 pb-20 md:pb-8">
            {/* ENCABEZADO */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Galería de Imágenes</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Sube tus fotos, copia la URL y pégala en el campo de imagen de tus productos.
                    </p>
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full md:w-auto flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 md:py-2 px-4 rounded-lg shadow transition-colors disabled:bg-blue-400"
                >
                    <FaUpload className="mr-2" /> {uploading ? 'Subiendo...' : 'Subir Fotos'}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            {uploading && (
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4">
                    <FaSpinner className="animate-spin" />
                    <span>{uploadProgress || 'Subiendo...'}</span>
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <FaSpinner className="animate-spin text-2xl text-blue-500" />
                </div>
            ) : images.length === 0 ? (
                <div className="text-center p-10 bg-white rounded-lg border border-dashed border-gray-300 mt-4">
                    <FaImages className="mx-auto text-4xl text-gray-300 mb-3" />
                    <p className="text-gray-500">No hay imágenes en la galería aún. Sube la primera foto.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {images.map((image) => (
                        <div key={image.public_id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 flex flex-col">
                            <div className="aspect-square bg-gray-100 overflow-hidden">
                                <img
                                    src={image.secure_url}
                                    alt={image.public_id}
                                    loading="lazy"
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <div className="p-2 flex flex-col gap-2">
                                <p className="text-xs text-gray-500 truncate" title={image.public_id}>
                                    {image.format?.toUpperCase()} · {image.width}x{image.height} · {formatBytes(image.bytes)}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleCopyUrl(image)}
                                        className="flex-1 flex items-center justify-center gap-1 text-xs font-medium py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                                    >
                                        {copiedId === image.public_id ? <FaCheck /> : <FaCopy />}
                                        {copiedId === image.public_id ? 'Copiada' : 'Copiar URL'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(image)}
                                        className="flex items-center justify-center text-xs font-medium py-1.5 px-2 rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                        title="Eliminar"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GalleryManagement;
