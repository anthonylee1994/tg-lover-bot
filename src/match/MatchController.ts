import {Inject, Singleton} from "typescript-ioc";
import {MatchService} from "./service/MatchService";
import {RegisterService} from "../register/RegisterService";
import {MatchMessage} from "./constant/MatchMessage";
import {UserPhotoService} from "../user/service/UserPhotoService";
import {UserConverter} from "../user/service/UserConverter";
import {Markup} from "telegraf";
import {MatchAction} from "./constant/MatchAction";
import {UserService} from "../user/service/UserService";
import {UserView} from "../common/view/user/UserView";
import {RegisterConcern} from "../common/controller/concern/RegisterConcern";
import {ProfileConcern} from "../common/controller/concern/ProfileConcern";
import {RegisterMessage} from "../register/constant/RegisterMessage";

@Singleton
export class MatchController {
    constructor(
        @Inject
        private matchService: MatchService,
        @Inject
        private registerService: RegisterService,
        @Inject
        private userService: UserService,
        @Inject
        private userPhotoService: UserPhotoService,
        @Inject
        private registerConcern: RegisterConcern,
        @Inject
        private profileConcern: ProfileConcern
    ) {}

    like = async ctx => {
        console.log(ctx);
        try {
            if (!(await this.auth(ctx))) return;

            try {
                await ctx.editMessageText(ctx.update.callback_query.message.text + "\n\n" + MatchMessage.LIKED, {parse_mode: "HTML"});
                await ctx.editMessageReplyMarkup(Markup.removeKeyboard());
            } catch (e) {}

            const targetId = `${ctx.match.input}`.replace(`${MatchAction.MATCH_LIKE}#`, "");
            const me = await this.userService.get(ctx.from.id);
            const target = await this.userService.get(targetId);
            const matched = await this.matchService.vote(ctx.from.id, targetId, true);

            if (matched && target && me) {
                await this.replyMatched(ctx, target);
                await this.notifyMatchTarget(ctx, targetId);
            }
        } catch (e) {
            console.log(e);
        }

        await this.match(ctx);
    };

    dislike = async ctx => {
        try {
            if (!(await this.auth(ctx))) return;

            try {
                await ctx.editMessageText(ctx.update.callback_query.message.text + "\n\n" + MatchMessage.DISLIKED, {parse_mode: "HTML"});
                await ctx.editMessageReplyMarkup(Markup.removeKeyboard());
            } catch (e) {}

            const targetId = `${ctx.match.input}`.replace(`${MatchAction.MATCH_DISLIKE}#`, "");
            await this.matchService.vote(ctx.from.id, targetId, false);
        } catch (e) {
            console.log(e);
        }

        await this.match(ctx);
    };

    match = async ctx => {
        try {
            if (!(await this.auth(ctx))) return;

            const user = await this.matchService.luckyPick(ctx.from.id);

            if (!user) {
                await ctx.replyWithHTML(MatchMessage.NO_MATCH);
                return;
            }

            await this.profileConcern.sendProfile(ctx, user, ctx.from.id, this.MATCH_BUTTONS(user));
        } catch (e) {
            console.log(e);
        }
    };

    recentLikedUsers = async ctx => {
        try {
            if (!(await this.auth(ctx))) return;

            const users = await this.matchService.recentLikedUsers(ctx.from.id);

            if (users.length === 0) {
                await ctx.replyWithHTML(MatchMessage.NO_RECENT_LIKED_USERS);
                return;
            }

            await ctx.reply(MatchMessage.RECENT_LIKED_PERSON_AS_BElOW.replace("{x}", users.length.toString()));
            await this.replyWithUsers(ctx, users);
        } catch (e) {
            console.log(e);
        }
    };

    recentLikedMe = async ctx => {
        try {
            if (!(await this.auth(ctx))) return;

            const users = await this.matchService.recentLikedMe(ctx.from.id);

            if (users.length === 0) {
                await ctx.replyWithHTML(MatchMessage.NO_RECENT_LIKED_ME);
                return;
            }

            await ctx.reply(MatchMessage.RECENT_LIKED_ME_AS_BElOW.replace("{x}", users.length.toString()));

            for (const user of users) {
                await this.profileConcern.sendProfile(ctx, user, ctx.from.id, this.MATCH_BUTTONS(user));
            }
        } catch (e) {
            console.log(e);
        }
    };

    recentMatchedUsers = async ctx => {
        try {
            if (!(await this.auth(ctx))) return;

            const users = await this.matchService.bidirectionalMatchedUsers(ctx.from.id);

            if (users.length === 0) {
                await ctx.replyWithHTML(MatchMessage.NO_RECENT_MATCHED_USERS);
                return;
            }

            await ctx.reply(MatchMessage.RECENT_MATCHED_PERSON_AS_BElOW.replace("{x}", users.length.toString()));
            await this.replyWithUsers(ctx, users, true);
        } catch (e) {
            console.log(e);
        }
    };

    private async auth(ctx) {
        if (!(await this.registerConcern.registerCheck(ctx))) return false;
        if (await this.blocked(ctx)) return false;
        if (await this.noUsername(ctx)) return false;
        await this.userService.renewUsername(ctx);
        return true;
    }

    private MATCH_BUTTONS = (user: UserView) => {
        return Markup.inlineKeyboard([
            Markup.button.callback(MatchMessage.LIKE, `${MatchAction.MATCH_LIKE}#${user.telegramId}`),
            Markup.button.callback(MatchMessage.DISLIKE, `${MatchAction.MATCH_DISLIKE}#${user.telegramId}`),
        ]);
    };

    private notifyMatchTarget = async (ctx, targetId: string) => {
        const me = (await this.userService.get(ctx.from.id))!;
        await ctx.telegram.sendMessage(targetId, `${this.matchedMessage(me)}\n\n${MatchMessage.MATCHED_PERSON_AS_BElOW}`, {parse_mode: "HTML"});
        await this.profileConcern.sendProfile(ctx, me, targetId);
    };

    private replyWithUsers = async (ctx, users: UserView[], showMatchedMessage?: boolean) => {
        const userPhotos = await this.userPhotoService.batchFetchPhotoURLs(users.map(user => user.telegramId));

        for (const user of users) {
            const photoURLs = userPhotos.filter(userPhoto => userPhoto.telegram_id === user.telegramId).map(userPhoto => userPhoto.photo_url);
            await this.profileConcern.sendProfilePhotos(ctx, photoURLs, ctx.from.id);
            await ctx.reply(UserConverter.template(user));

            if (showMatchedMessage) {
                await this.replyMatched(ctx, user);
            }
        }
    };

    private replyMatched = async (ctx: any, target: UserView) => {
        await ctx.reply(this.matchedMessage(target), {parse_mode: "HTML"});
    };

    private matchedMessage = (target: UserView) => {
        return MatchMessage.MATCHED.replace("{target_name}", `<b>${target.name!}</b>`).replace("{target_username}", target.username!);
    };

    private blocked = async (ctx: any) => {
        const blocked = await this.userService.isBlocked(ctx.from.id);
        if (blocked) {
            await ctx.replyWithHTML(MatchMessage.YOU_ARE_BLOCKED);
            return true;
        }
        return false;
    };

    private noUsername = async (ctx: any) => {
        if (!ctx.from.username) {
            await ctx.replyWithHTML(RegisterMessage.NO_USERNAME_ERROR);
            return true;
        }
        return false;
    };
}
