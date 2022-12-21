export function generateReadbleAccount(account: string) {
    return `${account.slice(0, 5)}...${account.slice(-4)}`;
}
