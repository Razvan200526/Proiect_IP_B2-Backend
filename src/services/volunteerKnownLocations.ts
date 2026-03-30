import type { IRepository } from "../db/repositories/base.repository";
import type { volunteerKnownLocations } from "../db/profile";

export type VolunteerKnownLocation = typeof volunteerKnownLocations.$inferSelect;
export type CreateVolunteerKnownLocationDTO = typeof volunteerKnownLocations.$inferInsert;
export type UpdateVolunteerKnownLocationDTO = Partial<CreateVolunteerKnownLocationDTO>;

export class VolunteerKnownLocationService {
    constructor(private readonly repo: IRepository<VolunteerKnownLocation, CreateVolunteerKnownLocationDTO, UpdateVolunteerKnownLocationDTO, number>) {}

    async addLocation(data: CreateVolunteerKnownLocationDTO): Promise<VolunteerKnownLocation> {
        return await this.repo.create({
            ...data,
            city: data.city?.trim() ?? null,
            addressText: data.addressText?.trim() ?? null,
        });
    }

    async getLocationById(id: number): Promise<VolunteerKnownLocation> {
        const location = await this.repo.findById(id);
        if (!location) throw new Error(`Location with id '${id}' not found.`);
        return location;
    }

    async getLocationsByVolunteerId(volunteerId: number): Promise<VolunteerKnownLocation[]> {
        return await this.repo.findMany(50, 0);
    }

    async getLocations(limit = 50, offset = 0): Promise<VolunteerKnownLocation[]> {
        return await this.repo.findMany(limit, offset);
    }

    async updateLocation(id: number, data: UpdateVolunteerKnownLocationDTO): Promise<VolunteerKnownLocation> {
        const exists = await this.repo.exists(id);
        if (!exists) throw new Error(`Location with id '${id}' not found.`);
        const result = await this.repo.update(id, {
            ...data,
            ...(data.city && { city: data.city.trim() }),
            ...(data.addressText && { addressText: data.addressText.trim() }),
        });
        return result!;
    }

    async deleteLocation(id: number): Promise<boolean> {
        const exists = await this.repo.exists(id);
        if (!exists) throw new Error(`Location with id '${id}' not found.`);
        return await this.repo.delete(id);
    }
}