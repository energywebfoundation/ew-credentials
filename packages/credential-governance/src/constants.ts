import { utils } from 'ethers';

const { parseEther } = utils;

export const PRINCIPAL_THRESHOLD = parseEther('100');
export const WITHDRAW_DELAY = 5;
