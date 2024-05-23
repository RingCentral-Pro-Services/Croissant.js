import React, { useEffect, useState } from "react";
// import {TextField, Autocomplete, CircularProgress, Typography} from '@mui/material'
import { Autocomplete, createStyles, Loader, rem, TextInput } from '@mantine/core';
import { AccountUID } from "../../models/AccountUID";

interface UIDInputFieldProps {
    className?: string
    setTargetUID: (value: string) => void
    disabled: boolean
    disabledText: string
    error?: string
    loading?: boolean
}

const useStyles = createStyles((theme, { floating }: { floating: boolean }) => ({
    root: {
      position: 'relative',
    },
  
    label: {
      position: 'absolute',
      zIndex: 2,
      top: rem(7),
      left: theme.spacing.sm,
      pointerEvents: 'none',
      color: floating
        ? theme.colorScheme === 'dark'
          ? theme.white
          : theme.black
        : theme.colorScheme === 'dark'
        ? theme.colors.dark[3]
        : theme.colors.gray[5],
      transition: 'transform 150ms ease, color 150ms ease, font-size 150ms ease',
      transform: floating ? `translate(-${theme.spacing.sm}, ${rem(-28)})` : 'none',
      fontSize: floating ? theme.fontSizes.xs : theme.fontSizes.sm,
      fontWeight: floating ? 500 : 400,
    },
  
    required: {
      transition: 'opacity 150ms ease',
      opacity: floating ? 1 : 0,
    },
  
    input: {
      '&::placeholder': {
        transition: 'color 150ms ease',
        color: !floating ? 'transparent' : undefined,
      },
    },
  }));

const UIDInputField: React.FC<UIDInputFieldProps> = ({setTargetUID, disabled, disabledText, error = '', loading = true, className = ''}) => {
    const [focused, setFocused] = useState(false);
    const [accounts, setAccounts] = useState<AccountUID[]>([])
    const { classes } = useStyles({ floating: disabledText.trim().length !== 0 || focused });

    useEffect(() => {
        let accountData = localStorage.getItem('accounts')
        if (!accountData) return

        setAccounts(JSON.parse(accountData))
    }, [])

    const handleInput = (value: string | null) => {
        if (!value) return

        if (containsLetters(value)) {
            for (const account of accounts) {
                if (account.name === value) {
                    setTargetUID(account.id)
                }
            }
        }
        else {
            setTargetUID(value)
        }
    }

    const containsLetters = (value: string) => {
        return /[a-zA-Z]/.test(value);
    }

    if (disabled) {
        return (
            <TextInput
                className={`${className} healthy-margin-right`}
                placeholder=""
                required
                classNames={classes}
                value={disabledText}
                autoComplete="nope"
                disabled
                sx={{width: 200, display: 'inline-block'}}
            />
        )
    }
    else {
        return (
            <>
                <div style={{display: 'inline-table'}} >
                <Autocomplete
                    className={`${className} healthy-margin-right`}
                    sx={{width: 200, display: 'inline-block'}}
                    data={accounts.map((account) => account.name)}
                    onChange={handleInput}
                    rightSection={loading ? <Loader size="1rem" /> : null}
                    placeholder="Account ID"
                />
                    {/* {error === '' ? <></> : <Typography sx={{display: 'block', color: 'red'}} variant='caption' >{error}</Typography>} */}
                </div>
                {/* {loading ? <CircularProgress className='vertical-middle healthy-margin-right' /> : <></>} */}
            </>
        )
    }
}

export default UIDInputField