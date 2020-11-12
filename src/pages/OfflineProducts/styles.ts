import React from 'react'
import styled from 'styled-components/native'
import { StyleSheet, Dimensions, PixelRatio } from 'react-native'

const widthPercentageToDP = widthPercent => {
    const screenWidth = Dimensions.get('window').width;
    return PixelRatio.roundToNearestPixel(screenWidth * parseFloat(widthPercent) / 100);
};

const heightPercentageToDP = heightPercent => {
    const screenHeight = Dimensions.get('window').height;
    return PixelRatio.roundToNearestPixel(screenHeight * parseFloat(heightPercent) / 100);
};

export const Container = styled.View`
display:flex;
justify-content:center;
padding-left: 10px;
padding-right:10px;
`
export const Logo = styled.Image`
width:90px;
height:90px;
`
export const tableStyles = StyleSheet.create({
    container: { paddingTop: 30, backgroundColor: '#fff', height: heightPercentageToDP('74%') },
    head: { backgroundColor: '#33333333', borderBottomWidth: 1 },
    text: { margin: 6 },
    row: { flexDirection: 'row', backgroundColor: 'transparent', borderBottomWidth: 1 },
})
