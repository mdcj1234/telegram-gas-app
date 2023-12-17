import { Aspects, Tag } from "aws-cdk-lib";
import { IConstruct } from "constructs";
import { APP_NAME } from "../../../config";

const contactK = "Contact";
const contactV = "marciodjc94@gmail.com";

const appK = "Application";
const appV = APP_NAME;

const ApplyTags = (construct: IConstruct) => {
  return {
    basic: () => {
      Aspects.of(construct).add(new Tag(contactK, contactV));
      Aspects.of(construct).add(new Tag(appK, appV));
      return ApplyTags(construct);
    },
    description: (desc: string) => {
      Aspects.of(construct).add(new Tag("ElementDescription", desc));
      return ApplyTags(construct);
    },
  };
};

export default ApplyTags;
