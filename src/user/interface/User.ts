import {Gender} from "../../common/enum/Gender";
import {GoalRelationship} from "../../common/enum/GoalRelationship";
import {Smoking} from "../../common/enum/Smoking";
import {Education} from "../../common/enum/Education";
import {FilterGender} from "../../common/enum/FilterGender";

export interface User {
    name: string;
    telegram_id: string;
    username: string;
    agree_terms: boolean;
    agree_username_permission: boolean;
    gender: Gender;
    age: number;
    height: number;
    goal_relationship: GoalRelationship;
    smoking: Smoking;
    occupation?: string | null;
    salary?: number | null;
    education?: Education | null;
    self_intro?: string | null;
    relationship_criteria?: string | null;
    info_updated: boolean;
    photo_uploaded: boolean;
    filter_updated: boolean;
    registered: boolean;
    blocked: boolean;
    filter_gender: FilterGender;
    filter_goal_relationship: boolean;
    filter_age_upper_bound: number;
    filter_age_lower_bound: number;
    filter_height_upper_bound: number;
    filter_height_lower_bound: number;
    created_at: string;
    updated_at: string;
}
