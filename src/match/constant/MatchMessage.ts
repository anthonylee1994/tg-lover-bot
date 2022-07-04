const NO_MATCH = "暫時已經沒有符合您配對條件的對象，請稍後再試，或者您可稍為擴闊您的配對條件🥲";
const LIKE = "💗喜歡";
const LIKED = "<b>💗已喜歡💗</b>";
const DISLIKE = "🙅‍不喜歡";
const DISLIKED = "<b>🙅已‍不喜歡🙅</b>";

const MATCHED = "您和 {target_name} 已經配對成功，您可以自行聯絡 @{target_username}，或等待對方回覆🥳";
const MATCHED_PERSON_AS_BElOW = "配對成功的對象如下：";

const RECENT_LIKED_PERSON_AS_BElOW = "您最近喜歡的{x}個對象如下：";
const RECENT_LIKED_ME_AS_BElOW = "最近喜歡您的{x}個對象如下：";
const RECENT_MATCHED_PERSON_AS_BElOW = "您最近成功配對的{x}個對象如下：";

const NO_RECENT_LIKED_USERS = "您目前還沒有喜歡的對象🥲";
const NO_RECENT_LIKED_ME = "目前還沒有喜歡您的對象🥲";

const NO_RECENT_MATCHED_USERS = "您目前還沒有成功配對的對象🥲";

const YOU_ARE_BLOCKED = "您的帳號已經被管理員封鎖，請聯絡管理員 @internal_server_error 解除封鎖🤔";

export const MatchMessage = Object.freeze({
    NO_MATCH,
    LIKE,
    LIKED,
    DISLIKE,
    DISLIKED,
    MATCHED,
    MATCHED_PERSON_AS_BElOW,
    RECENT_LIKED_PERSON_AS_BElOW,
    NO_RECENT_LIKED_USERS,
    NO_RECENT_MATCHED_USERS,
    NO_RECENT_LIKED_ME,
    RECENT_MATCHED_PERSON_AS_BElOW,
    RECENT_LIKED_ME_AS_BElOW,
    YOU_ARE_BLOCKED,
});
