import {Knex} from "knex";
import {db} from "../../common/db";
import {Inject, Singleton} from "typescript-ioc";
import {UserService} from "../../user/service/UserService";
import {FilterGender} from "../../common/enum/FilterGender";
import {Gender} from "../../common/enum/Gender";
import {User} from "../../user/interface/User";
import {UserConverter} from "../../user/service/UserConverter";
import {UserView} from "../../common/view/user/UserView";

@Singleton
export class MatchService {
    constructor(
        @Inject
        private readonly userService: UserService
    ) {}

    async recentLikedUsers(userId: string): Promise<UserView[]> {
        const targetIds = await MatchService.matchRepository
            .pluck("target_id")
            .where({user_id: userId, like: true})
            .andWhere("created_at", ">", db.raw("'now'::timestamp - '1 month'::interval"))
            .andWhere("target_id", "NOT IN", db.raw(this.notPermittedIdsQuery))
            .orderBy("created_at", "desc")
            .limit(5);

        const users = await this.userService.list(targetIds);

        return targetIds.map(id => users.find(u => u.telegramId === id));
    }

    async recentLikedMe(userId: string): Promise<UserView[]> {
        const likedMeIds = await MatchService.matchRepository
            .pluck("user_id")
            .where({target_id: userId, like: true})
            .andWhere("created_at", ">", db.raw("'now'::timestamp - '1 month'::interval"))
            .andWhere("user_id", "NOT IN", db.raw(this.notPermittedIdsQuery))
            .andWhere("user_id", "NOT IN", db.raw(this.bidirectionalMatchedIdsQuery, [userId]))
            .orderBy("created_at", "desc")
            .limit(5);

        const users = await this.userService.list(likedMeIds);

        return likedMeIds.map(id => users.find(u => u.telegramId === id));
    }

    async bidirectionalMatchedUsers(userId: string): Promise<UserView[]> {
        const userIds = await MatchService.matchRepository
            .pluck("user_id")
            .where({target_id: userId, like: true})
            .andWhere("user_id", "IN", db.raw(`SELECT target_id FROM matches WHERE user_id = ? AND "like" = true`, [userId]))
            .andWhere("user_id", "NOT IN", db.raw(this.notPermittedIdsQuery))
            .orderBy("created_at", "desc")
            .limit(5);

        return this.userService.list(userIds);
    }

    async vote(userId: string, targetId: string, like: boolean): Promise<boolean> {
        const recentVotedIds = await this.recentVotedIds(userId);
        const notPermittedIds = await this.notPermittedIds();

        if (notPermittedIds.includes(targetId)) {
            return false;
        }

        if (recentVotedIds.includes(targetId)) {
            await MatchService.matchRepository.update({like}).where({user_id: userId, target_id: targetId}).andWhere("created_at", ">", db.raw("'now'::timestamp - '1 month'::interval"));
        } else {
            await MatchService.matchRepository.insert({user_id: userId, target_id: targetId, like});
        }

        const bidirectionalMatchIds = await this.bidirectionalMatchedIds(userId);

        return bidirectionalMatchIds.includes(targetId);
    }

    async luckyPick(userId: string): Promise<UserView | null> {
        const currentUser = await this.userService.get(userId);

        if (!currentUser) return null;

        const luckyPickQuery = MatchService.userRepository.select<User[]>();
        MatchService.filterGender(luckyPickQuery, currentUser.gender!, currentUser.filterGender!);

        if (currentUser.filterGoalRelationship) luckyPickQuery.andWhere("goal_relationship", currentUser.goalRelationship);
        luckyPickQuery.andWhereBetween("age", [currentUser.filterAgeLowerBound!, currentUser.filterAgeUpperBound!]);
        luckyPickQuery.andWhereBetween("height", [currentUser.filterHeightLowerBound!, currentUser.filterHeightUpperBound!]);
        luckyPickQuery.andWhere("telegram_id", "<>", userId);
        luckyPickQuery.andWhere("telegram_id", "NOT IN", db.raw(this.recentVotedIdsQuery, [userId]));
        luckyPickQuery.andWhere("telegram_id", "NOT IN", db.raw(this.bidirectionalMatchedIdsQuery, [userId]));
        luckyPickQuery.andWhere("telegram_id", "NOT IN", db.raw(this.notPermittedIdsQuery));
        luckyPickQuery.orderByRaw("RANDOM()");
        luckyPickQuery.limit(1);
        const pickedUser = await luckyPickQuery.first();

        if (!pickedUser) return null;
        return UserConverter.view(pickedUser);
    }

    private static filterGender(query: Knex.QueryBuilder, gender: Gender, filterGender: FilterGender): void {
        switch (filterGender) {
            case FilterGender.異性:
                query.where({gender: gender === Gender.男 ? Gender.女 : Gender.男});
                break;
            case FilterGender.同性:
                query.where({gender});
                break;
            default:
                break;
        }
    }

    private async notPermittedIds(): Promise<string[]> {
        const result = await db.raw(this.notPermittedIdsQuery);
        return result.rows.map(r => r.telegram_id);
    }

    private async recentVotedIds(userId: string): Promise<string[]> {
        const result = await db.raw(this.recentVotedIdsQuery, [userId]);
        return result.rows.map(r => r.target_id);
    }

    private async bidirectionalMatchedIds(userId: string): Promise<string[]> {
        const result = await db.raw(this.bidirectionalMatchedIdsQuery, [userId]);
        return result.rows.map(r => r.target_id);
    }

    private static get userRepository() {
        return db.table("users");
    }

    private static get matchRepository() {
        return db.table("matches");
    }

    private recentVotedIdsQuery = "SELECT target_id FROM matches WHERE user_id= ? AND created_at > 'now'::timestamp - '1 month'::interval";

    private notPermittedIdsQuery = "SELECT telegram_id FROM users WHERE blocked = true OR username IS NULL OR registered IS false";

    private bidirectionalMatchedIdsQuery = `SELECT DISTINCT target_id FROM matches AS m1 WHERE user_id = ? AND "like" = true AND target_id IN (SELECT user_id FROM matches AS m2 WHERE target_id = m1.user_id AND "like" = true)`;
}
