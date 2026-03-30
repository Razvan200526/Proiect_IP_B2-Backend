import type { IRepository } from "../db/repositories/base.repository";
import type { volunteerProfiles } from "../db/profile";

export type VolunteerProfile = typeof volunteerProfiles.$inferSelect;
export type CreateVolunteerProfileDTO = typeof volunteerProfiles.$inferInsert;
export type UpdateVolunteerProfileDTO = Partial<CreateVolunteerProfileDTO>;

export class VolunteerProfileService {
    constructor(private readonly repo: IRepository<VolunteerProfile, CreateVolunteerProfileDTO, UpdateVolunteerProfileDTO, number>) {}

    async createVolunteerProfile(data: CreateVolunteerProfileDTO): Promise<VolunteerProfile> {
        const existing = await this.repo.findFirstBy({ volunteerId: data.volunteerId });
        if (existing) throw new Error(`Profile for volunteer '${data.volunteerId}' already exists.`);
        return await this.repo.create(data);
    }

    async getVolunteerProfileById(id: number): Promise<VolunteerProfile> {
        const profile = await this.repo.findById(id);
        if (!profile) throw new Error(`VolunteerProfile with id '${id}' not found.`);
        return profile;
    }

    async getVolunteerProfileByVolunteerId(volunteerId: number): Promise<VolunteerProfile> {
        const profile = await this.repo.findFirstBy({ volunteerId });
        if (!profile) throw new Error(`VolunteerProfile for volunteer '${volunteerId}' not found.`);
        return profile;
    }

    async getVolunteerProfiles(limit = 50, offset = 0): Promise<VolunteerProfile[]> {
        return await this.repo.findMany(limit, offset);
    }

    async updateVolunteerProfile(id: number, data: UpdateVolunteerProfileDTO): Promise<VolunteerProfile> {
        const exists = await this.repo.exists(id);
        if (!exists) throw new Error(`VolunteerProfile with id '${id}' not found.`);
        const result = await this.repo.update(id, data);
        return result!;
    }

    async deleteVolunteerProfile(id: number): Promise<boolean> {
        const exists = await this.repo.exists(id);
        if (!exists) throw new Error(`VolunteerProfile with id '${id}' not found.`);
        return await this.repo.delete(id);
    }
}