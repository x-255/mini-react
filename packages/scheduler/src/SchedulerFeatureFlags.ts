// 这里我们使用31位是因为JavaScript的位运算是基于32位有符号整数的，
// 其中一位用于表示符号（正或负），所以最大安全整数是2^31 - 1，即2147483647。
// 但是为了避免潜在的溢出问题，我们选择使用2^30 - 1，即1073741823，作为一个更安全的上限。
export const maxSigned31BitInt = 1073741823;

export const userBlockingPriorityTimeout = 250;

export const normalPriorityTimeout = 5000;

export const lowPriorityTimeout = 10000;