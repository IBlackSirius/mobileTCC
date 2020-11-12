
import React, { useEffect, useRef, forwardRef } from 'react'
import { TextInputProps } from 'react-native'

import { Container, TextInput } from './styles'

import { useField } from '@unform/core'

interface InputProps extends TextInputProps {
    name: string;
}

interface InputValueReference {
    value: string
}
interface InputRef {
    focus(): void
}


const Input: React.ForwardRefRenderFunction<InputRef, InputProps> = ({ name, ...props }, ref) => {
    const { registerField, defaultValue = '', fieldName, error } = useField(name)
    const inputElementRef = useRef<any>(null)
    const inputValueRef = useRef<InputValueReference>({ value: defaultValue })
    const formRef = useRef(null);

    useEffect(() => {
        registerField<string>({
            name: fieldName,
            ref: inputValueRef.current,
            path: 'value',
            setValue(ref: any, value) {
                inputValueRef.current.value = value
                inputElementRef.current.setNativeProps({ text: value });
            },
            clearValue() {
                inputValueRef.current.value = '',
                    inputElementRef.current.clear()
            }
        })
    }, [fieldName, registerField]);

    return (
        <Container >
            <TextInput

                {...props}
                defaultValue={defaultValue}
                onChangeText={value => {
                    inputValueRef.current.value = value
                }}
            />
        </Container>

    )
}

export default forwardRef(Input)