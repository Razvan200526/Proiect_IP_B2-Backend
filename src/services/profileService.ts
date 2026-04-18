import{
    type ProfileRepository,
    profileRepository,
} from "../db/repositories/profile.repository";   

export class ProfileService{
    private readonly repo: ProfileRepository;
    
    constructor(){
        this.repo = profileRepository;
    }

    async createProfile(userId: string, data: {bio? : string; languages? : string[]; hiddenIdentity? : boolean}){
        const existing = await this.repo.findFirstBy({userId});
        if(existing) throw new Error(`Profile for user '${userId}' already exists`);
        return await this.repo.create({
            userId,
            bio: data.bio?.trim()??null,
            languages: data.languages ?? [],
            hiddenIdentity : data.hiddenIdentity ?? false,

        });

    }
    async getProfileByUserId(userId: string) {
        const profile = await this.repo.findFirstBy({ userId });
        if (!profile) throw new Error(`Profile for user '${userId}' not found.`);
        return profile;
    }

    async getProfileById(id: number) {
        const profile = await this.repo.findById(id);
        if (!profile) throw new Error(`Profile with id '${id}' not found.`);
        return profile;
    }


    async updateProfile(userId: string, data: { bio?: string; languages?: string[]; hiddenIdentity?: boolean }) {
        const existing = await this.repo.findFirstBy({ userId });
        if (!existing) throw new Error(`Profile for user '${userId}' not found.`);

        return await this.repo.update(existing.id, {
            ...data,
            ...(data.bio !== undefined && { bio: data.bio.trim() }),
        });
    }

    async deleteProfile(userId: string) {
        const existing = await this.repo.findFirstBy({ userId });
        if (!existing) throw new Error(`Profile for user '${userId}' not found.`);
        return await this.repo.delete(existing.id);
    }

}
export const profileService = new ProfileService();
