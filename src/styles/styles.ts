import { Dimensions, StyleSheet } from 'react-native'
const screenWidth = Dimensions.get('screen').width

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#440031',

    alignItems: 'center',
    // paddingTop: 250,
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
})

export default styles
