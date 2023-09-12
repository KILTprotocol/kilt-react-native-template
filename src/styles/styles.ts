import { Dimensions, StyleSheet } from 'react-native'
const screenWidth = Dimensions.get('screen').width
const screenHeight = Dimensions.get('screen').height

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#440031',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#440031',
  },
  text: {
    color: 'white',
    marginBottom: 20,
    fontSize: 30,
  },
  textInput: {
    padding: 5,
    paddingStart: 15,
    backgroundColor: '#3b3b3b',
    width: screenWidth * 0.8,
    borderRadius: 25,
    marginBottom: 15,
    color: 'white',
    fontWeight: '600',
  },
  loginBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ff1178',
    borderRadius: 25,
    color: 'white',
    textAlign: 'center',
  },
  rectangleButtonPink: {
    height: screenHeight * 0.1,
    width: screenWidth,
    backgroundColor: 'rgba(249,105,67,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1%',
  },
  rectangleButtonPurple: {
    height: screenHeight * 0.1,
    width: screenWidth,
    padding: '1%',
    backgroundColor: 'rgba(0,169,157,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rectangleButtonText: {
    paddingLeft: '9.33%',
    paddingRight: '29.33%',
    color: '#FFFFFF',
    // justifyContent: 'flex-end',
  },
  rectangleButtonManager: {
    // paddingRight: '29.33%',
  },
  rectangleButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default styles
