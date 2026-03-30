import { profileRepository, type Profile, type CreateProfileDTO, type UpdateProfileDTO } from "../db/repositories/profile.repository";


export class ProfileService {
    async createProfile(data: CreateProfileDTO): Promise<Profile> {
        const existing = await profileRepository.findByUserId(data.userId);
        if (existing) {
            throw new Error(`Profile for user '${data.userId}' already exists.`);
        }
        return await profileRepository.create({
            ...data,
            bio: data.bio?.trim() ?? null,
        });
    }

    async getProfileById(id: number): Promise<Profile> {
        const profile = await profileRepository.findById(id);
        if (!profile) throw new Error(`Profile with id '${id}' not found.`);
        return profile;
    }

    async getProfileByUserId(userId: string): Promise<Profile> {
        const profile = await profileRepository.findByUserId(userId);
        if (!profile) throw new Error(`Profile for user '${userId}' not found.`);
        return profile;
    }

    async getProfiles(limit = 50, offset = 0): Promise<Profile[]> {
        return await profileRepository.findMany(limit, offset);
    }

    async updateProfile(id: number, data: UpdateProfileDTO): Promise<Profile> {
        const exists = await profileRepository.exists(id);
        if (!exists) throw new Error(`Profile with id '${id}' not found.`);
        const result = await profileRepository.update(id, {
            ...data,
            ...(data.bio && { bio: data.bio.trim() }),
        });
        return result!;
    }

    async deleteProfile(id: number): Promise<boolean> {
        const exists = await profileRepository.exists(id);
        if (!exists) throw new Error(`Profile with id '${id}' not found.`);
        return await profileRepository.delete(id);
    }
}

export const profileService = new ProfileService();