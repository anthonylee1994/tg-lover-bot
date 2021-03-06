import {ArrayMaxSize, ArrayMinSize, IsArray, IsDefined, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min} from "class-validator";
import {FieldValidationMessage} from "../../core/validation/FieldValidationMessage";
import {Education} from "../../enum/Education";
import {Gender} from "../../enum/Gender";
import {GoalRelationship} from "../../enum/GoalRelationship";
import {Smoking} from "../../enum/Smoking";
import {FilterGender} from "../../enum/FilterGender";

export class UserView {
    public telegramId: string = "";

    @IsDefined({message: FieldValidationMessage.IS_DEFINED})
    @IsNotEmpty({message: FieldValidationMessage.IS_NOT_EMPTY})
    public name: string | undefined;

    public username?: string;

    public agreeTerms?: boolean;

    public agreeUsernamePermission?: boolean;

    public infoUpdated?: boolean;

    public photoUploaded?: boolean;

    public filterUpdated?: boolean;

    public registered?: boolean;

    public blocked?: boolean;

    @IsDefined({message: FieldValidationMessage.IS_DEFINED})
    @IsEnum(Gender, {message: FieldValidationMessage.IS_ENUM})
    public gender: Gender | undefined;

    @IsDefined({message: FieldValidationMessage.IS_DEFINED})
    @IsNumber({allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0}, {message: FieldValidationMessage.IS_NUMBER})
    @Min(13, {message: FieldValidationMessage.MIN})
    @Max(99, {message: FieldValidationMessage.MAX})
    public age: number | undefined;

    @IsDefined({message: FieldValidationMessage.IS_DEFINED})
    @IsNumber({allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0}, {message: FieldValidationMessage.IS_NUMBER})
    @Min(140, {message: FieldValidationMessage.MIN})
    @Max(220, {message: FieldValidationMessage.MAX})
    public height: number | undefined;

    @IsDefined({message: FieldValidationMessage.IS_DEFINED})
    @IsEnum(GoalRelationship, {message: FieldValidationMessage.IS_ENUM})
    public goalRelationship: GoalRelationship | undefined;

    @IsDefined({message: FieldValidationMessage.IS_DEFINED})
    @IsEnum(Smoking, {message: FieldValidationMessage.IS_ENUM})
    public smoking: Smoking | undefined;

    @IsString({message: FieldValidationMessage.IS_STRING})
    @IsNotEmpty({message: FieldValidationMessage.IS_NOT_EMPTY})
    public occupation: string | null | undefined;

    @IsOptional()
    @IsNumber({allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2}, {message: FieldValidationMessage.IS_NUMBER})
    @Min(0, {message: FieldValidationMessage.MIN})
    @Max(100_000_000, {message: FieldValidationMessage.MAX})
    public salary: number | null | undefined;

    @IsOptional()
    @IsEnum(Education, {message: FieldValidationMessage.IS_ENUM})
    public education: Education | null | undefined;

    @IsDefined({message: FieldValidationMessage.IS_DEFINED})
    @IsArray()
    @ArrayMinSize(1, {message: FieldValidationMessage.ARRAY_MIN_SIZE})
    @ArrayMaxSize(10, {message: FieldValidationMessage.ARRAY_MAX_SIZE})
    public selfIntro: string[] | null | undefined;

    @IsDefined({message: FieldValidationMessage.IS_DEFINED})
    @IsArray()
    @ArrayMinSize(1, {message: FieldValidationMessage.ARRAY_MIN_SIZE})
    @ArrayMaxSize(10, {message: FieldValidationMessage.ARRAY_MAX_SIZE})
    public relationshipCriteria: string[] | null | undefined;

    public filterGender: FilterGender | undefined;
    public filterGoalRelationship: boolean | undefined;

    public filterAgeLowerBound: number | undefined;
    public filterAgeUpperBound: number | undefined;
    public filterHeightLowerBound: number | undefined;
    public filterHeightUpperBound: number | undefined;

    public createdAt: string | undefined;
    public updatedAt: string | undefined;
}
