export const normalizeAvatarUrl = (value) => {
    if (!value)
        return '';
    const avatar = value.trim();
    if (!avatar)
        return '';
    if (avatar.startsWith('file:/') || /^[a-zA-Z]:\\/.test(avatar)) {
        return '';
    }
    return avatar;
};
