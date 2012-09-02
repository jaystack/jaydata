#!/bin/bash

export AWS_ACCESS_KEY_ID="$1"
export AWS_SECRET_ACCESS_KEY="$2"

/usr/local/boto/bin/route53 del_record Z18PNRQAJADE0C $3 A `/usr/local/boto/bin/route53 get Z18PNRQAJADE0C | grep $3 | awk '{print $4}'` 60
/usr/local/boto/bin/route53 add_record Z18PNRQAJADE0C $3 A $4 60

