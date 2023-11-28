#!/usr/bin/env node

import cdk from "aws-cdk-lib";
import { DeleterCustomResourceStack } from "../lib/deleter-custom-resource-stack.js";

const app = new cdk.App();
new DeleterCustomResourceStack(app, 'DeleterCustomResourceStack', {
});
