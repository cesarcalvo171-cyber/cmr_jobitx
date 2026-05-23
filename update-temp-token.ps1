$token = "EAAW74SJqZBYkBRqHRZC81o6XGFIlOMVhlrcPZC8nfVLEzFtnZBN53iDPRt3ZCEpe3KnZChBTQJcYmhAocYZBFQehHZAG2ZBHHEfxGYgoXVR1MHv3IcopFkqAIdRwha1yZBshV"
Write-Output $token | npx vercel env add WHATSAPP_ACCESS_TOKEN production --force 2>&1
