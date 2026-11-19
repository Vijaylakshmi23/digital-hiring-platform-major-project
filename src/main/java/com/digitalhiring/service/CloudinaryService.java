package com.digitalhiring.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public Map<String, Object> uploadImage(MultipartFile file)
            throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                "Please select an image"
            );
        }

        Map<?, ?> result = cloudinary.uploader().upload(
            file.getBytes(),
            ObjectUtils.asMap(
                "folder", "labourconnect/workers",
                "resource_type", "image"
            )
        );

        return Map.of(
            "imageUrl", result.get("secure_url"),
            "publicId", result.get("public_id")
        );
    }

    public void deleteImage(String publicId) throws IOException {

        if (publicId == null || publicId.isBlank()) {
            return;
        }

        cloudinary.uploader().destroy(
            publicId,
            ObjectUtils.emptyMap()
        );
    }
}