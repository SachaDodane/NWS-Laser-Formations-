'use client';

import React from 'react';

interface CourseFormFieldsProps {
  values: {
    title: string;
    description: string;
    price: number | string;
    imageUrl?: string;
  };
  errors: {
    title?: string;
    description?: string;
    price?: string;
    imageUrl?: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export default function CourseFormFields({
  values,
  errors,
  onChange,
}: CourseFormFieldsProps) {
  return (
    <>
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Titre de la formation <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={values.title}
          onChange={onChange}
          className={`form-input ${errors.title ? 'border-red-500' : ''}`}
          placeholder="ex: Sécurité Laser Niveau 1"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={values.description}
          onChange={onChange}
          rows={4}
          className={`form-input ${errors.description ? 'border-red-500' : ''}`}
          placeholder="Décrivez votre formation en quelques phrases..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
          Prix (€) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="price"
          name="price"
          value={values.price}
          onChange={onChange}
          min="0"
          step="0.01"
          className={`form-input ${errors.price ? 'border-red-500' : ''}`}
          placeholder="ex: 199.99"
        />
        {errors.price && (
          <p className="mt-1 text-sm text-red-500">{errors.price}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
          URL de l'image (optionnel)
        </label>
        <input
          type="text"
          id="imageUrl"
          name="imageUrl"
          value={values.imageUrl || ''}
          onChange={onChange}
          className={`form-input ${errors.imageUrl ? 'border-red-500' : ''}`}
          placeholder="ex: https://example.com/image.jpg"
        />
        {values.imageUrl && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-1">Aperçu :</p>
            <img 
              src={values.imageUrl} 
              alt="Aperçu" 
              className="h-32 w-auto object-cover rounded border border-gray-200"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.src = '/placeholder-image.jpg';
              }}
            />
          </div>
        )}
        {errors.imageUrl && (
          <p className="mt-1 text-sm text-red-500">{errors.imageUrl}</p>
        )}
      </div>
    </>
  );
}
