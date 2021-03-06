import {Scenes, session, Telegraf} from "telegraf";
import {registerScene} from "./register/RegisterScene";
import {Container} from "typescript-ioc";
import {MatchController} from "./match/MatchController";
import {UserInfoController} from "./user/controller/UserInfoController";
import {MiscellaneousController} from "./miscellaneous/MiscellaneousController";
import {UserFilterController} from "./user/controller/UserFilterController";
import {UserPhotoController} from "./user/controller/UserPhotoController";
import {CommonController} from "./common/controller/CommonController";
import {server} from "./common/server";
import {AdminController} from "./admin/AdminController";
import {StatsController} from "./stats/StatsController";

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const commonController = Container.get(CommonController);
const matchController = Container.get(MatchController);
const userInfoController = Container.get(UserInfoController);
const userFilterController = Container.get(UserFilterController);
const userPhotoController = Container.get(UserPhotoController);
const miscellaneousController = Container.get(MiscellaneousController);
const adminController = Container.get(AdminController);
const statsController = Container.get(StatsController);

const bot = new Telegraf(process.env.BOT_TOKEN || "");

const stage: any = new Scenes.Stage([registerScene as any]);
bot.use(session());
bot.use(stage.middleware());

bot.start((ctx: any) => ctx.scene.enter("register"));

bot.command("register", (ctx: any) => ctx.scene.enter("register"));

bot.command("match", matchController.match);
bot.command("recent_liked", matchController.recentLikedUsers);
bot.command("recent_liked_me", matchController.recentLikedMe);
bot.command("recent_matched", matchController.recentMatchedUsers);

bot.action(/MATCH_LIKE#(.+)/, matchController.like);
bot.action(/MATCH_DISLIKE#(.+)/, matchController.dislike);

bot.command("update_info", userInfoController.askForUserInfo);
bot.command("my_info", userInfoController.myInfo);
bot.command("renew", userInfoController.renewUsername);
bot.command("delgame", userInfoController.deleteAccount);

bot.command("update_filter", userFilterController.askForFilter);
bot.command("my_filter", userFilterController.myFilter);

bot.command("donate", miscellaneousController.donate);
bot.command("feedback", miscellaneousController.feedback);

bot.on("web_app_data", commonController.webAppData);

bot.on("photo", commonController.photo);
bot.command("upload_photos", userPhotoController.askForUploadPhotos);
bot.command("clear_photos", userPhotoController.clearPhotos);

bot.command("stats", statsController.stats);

bot.command("block", adminController.block);
bot.command("unblock", adminController.unblock);

server(bot);
