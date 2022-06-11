import {UserService} from "../service/UserService";
import {Inject} from "typescript-ioc";
import {UserView} from "../../common/view/user/UserView";
import uuid from "uuid";
import {Gender} from "../../common/enum/Gender";
import {RandomUtil} from "../../common/util/RandomUtil";
import {GoalRelationship} from "../../common/enum/GoalRelationship";
import {Smoking} from "../../common/enum/Smoking";
import {faker} from "@faker-js/faker";
import {Education} from "../../common/enum/Education";
import {FilterGender} from "../../common/enum/FilterGender";

export class MockUserFactory {
    constructor(
        @Inject
        private userService: UserService
    ) {}

    public async create() {
        const userView = new UserView();
        userView.telegramId = uuid.v4();
        userView.agreeTerms = true;
        userView.agreeUsernamePermission = true;
        userView.infoUpdated = true;
        userView.photoUploaded = true;
        userView.filterUpdated = true;
        userView.gender = RandomUtil.randomPick(Gender);
        userView.age = RandomUtil.randomRange(18, 99);
        userView.height = RandomUtil.randomRange(140, 220);
        userView.goalRelationship = RandomUtil.randomPick(GoalRelationship);
        userView.smoking = RandomUtil.randomPick(Smoking);
        userView.occupation = faker.name.jobTitle();
        userView.salary = RandomUtil.randomRange(20_000, 80_000);
        userView.education = RandomUtil.randomPick(Education);
        userView.selfIntro = [faker.lorem.sentence(), faker.lorem.sentence(), faker.lorem.sentence()];
        userView.relationshipCriteria = [faker.lorem.sentence(), faker.lorem.sentence(), faker.lorem.sentence()];
        userView.photoURLs = [faker.image.avatar(), faker.image.avatar(), faker.image.avatar()];
        userView.filterGender = RandomUtil.randomPick(FilterGender);
        userView.filterAgeLowerBound = 18;
        userView.filterAgeUpperBound = 99;
        userView.filterHeightLowerBound = 140;
        userView.filterHeightUpperBound = 220;
        await this.userService.upsert(userView);
    }
}