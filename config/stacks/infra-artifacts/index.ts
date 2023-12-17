import { ENV, INFRA_ARTIFACTS_STACK } from "../..";

export const InfraBucketID = `${INFRA_ARTIFACTS_STACK}-bucket`;

export const InfraBucketName = `${INFRA_ARTIFACTS_STACK}-bucket${ENV()}`;
