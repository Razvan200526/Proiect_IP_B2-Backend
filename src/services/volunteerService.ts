import type { IRepository } from "../db/repositories/base.repository";
import type { volunteers } from "../db/profile";

export type Volunteer = typeof volunteers.$inferSelect;
export type CreateVolunteerDTO = typeof volunteers.$inferInsert;
export type UpdateVolunteerDTO = Partial<CreateVolunteerDTO>;

export class VolunteerService {
    constructor(private readonly repo: IRepository<Volunteer, CreateVolunteerDTO, UpdateVolunteerDTO, number>) {}

    async createVolunteer(data: CreateVolunteerDTO): Promise<Volunteer> {
        const existing = await this.repo.findFirstBy({ userId: data.userId });
        if (existing) throw new Error(`Volunteer for user '${data.userId}' already exists.`);
        return await this.repo.create(data);
    }

    async getVolunteerById(id: number): Promise<Volunteer> {
        const volunteer = await this.repo.findById(id);
        if (!volunteer) throw new Error(`Volunteer with id '${id}' not found.`);
        return volunteer;
    }

    async getVolunteerByUserId(userId: string): Promise<Volunteer> {
        const volunteer = await this.repo.findFirstBy({ userId });
        if (!volunteer) throw new Error(`Volunteer for user '${userId}' not found.`);
        return volunteer;
    }

    async getVolunteers(limit = 50, offset = 0): Promise<Volunteer[]> {
        return await this.repo.findMany(limit, offset);
    }

    async updateVolunteer(id: number, data: UpdateVolunteerDTO): Promise<Volunteer> {
        const exists = await this.repo.exists(id);
        if (!exists) throw new Error(`Volunteer with id '${id}' not found.`);
        const result = await this.repo.update(id, data);
        return result!;
    }

    async setAvailability(id: number, availability: boolean): Promise<Volunteer> {
        const exists = await this.repo.exists(id);
        if (!exists) throw new Error(`Volunteer with id '${id}' not found.`);
        const result = await this.repo.update(id, { availability });
        return result!;
    }

    async deleteVolunteer(id: number): Promise<boolean> {
        const exists = await this.repo.exists(id);
        if (!exists) throw new Error(`Volunteer with id '${id}' not found.`);
        return await this.repo.delete(id);
    }
}