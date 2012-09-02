#!/bin/bash

export AWS_ACCESS_KEY_ID="AKIAIG4TPDXK5XR64FLA"
export AWS_SECRET_ACCESS_KEY="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"

/usr/local/boto/bin/route53 del_record Z18PNRQAJADE0C $1 A `/usr/local/boto/bin/route53 get Z18PNRQAJADE0C | grep $1 | awk '{print $4}'` 60
/usr/local/boto/bin/route53 add_record Z18PNRQAJADE0C $1 A $2 60

